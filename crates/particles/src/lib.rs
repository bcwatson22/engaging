//! Particle simulation for the site's background field.
//!
//! Rust owns the simulation; JavaScript owns the drawing. The state lives in
//! one flat `f32` buffer in linear memory, and JS reads it directly each frame
//! and issues the canvas calls itself. Nothing crosses the boundary per
//! particle, which is what makes this cheaper than calling into WASM to draw.
//!
//! There is deliberately no `wasm-bindgen` here. The whole interface is a
//! pointer and a handful of numbers, so bindings would add a code generator,
//! a build step and a JS glue file to express what five `extern "C"` functions
//! already say.

// no_std on the wasm target only. Host builds — which is what `cargo test`
// produces — keep std, so the test harness links normally.
#![cfg_attr(target_arch = "wasm32", no_std)]

#[cfg(target_arch = "wasm32")]
#[panic_handler]
fn panic(_: &core::panic::PanicInfo) -> ! {
    loop {}
}

/// `[x, y, vx, vy, bubble]` per particle.
const STRIDE: usize = 5;

/// Ceiling on the buffer. Linear memory is never grown: a `Float32Array` view
/// over `memory.buffer` silently detaches if it is, and reads zeros from then
/// on. Allocating for the worst case is a few hundred kilobytes and removes
/// that failure mode entirely.
const MAX: usize = 8192;

/// Any non-zero constant. xorshift degenerates to all-zeroes if seeded with 0.
const INITIAL_SEED: u32 = 0x9e37_79b9;

/// The reference area tsparticles scales its particle count against.
const DENSITY_WIDTH: f32 = 1920.0;
const DENSITY_HEIGHT: f32 = 1080.0;

struct State {
    data: [f32; MAX * STRIDE],
    count: usize,
    width: f32,
    height: f32,
    seed: u32,
    configured: f32,
    speed: f32,
    radius: f32,
    bubble_range: f32,
    bubble_duration: f32,
}

/// `UnsafeCell` rather than `static mut`: the latter now trips `static_mut_refs`
/// on every access, and the workarounds for that trip clippy's `deref_addrof`
/// in turn. This says the same thing without arguing with either lint.
struct Shared(core::cell::UnsafeCell<State>);

// Single-threaded by construction: WebAssembly on the main thread, one
// instance per page. There is no second thread to race with.
unsafe impl Sync for Shared {}

/// Every field is zero so the whole static lands in `.bss`, which WebAssembly
/// zeroes at instantiation for free. A single non-zero field here would force
/// the entire struct — the 160KB buffer included — to be emitted as a data
/// segment in the `.wasm`. The seed is therefore established by `configure`
/// rather than declared here.
static STATE: Shared = Shared(core::cell::UnsafeCell::new(State {
    data: [0.0; MAX * STRIDE],
    count: 0,
    width: 0.0,
    height: 0.0,
    seed: 0,
    configured: 0.0,
    speed: 0.0,
    radius: 0.0,
    bubble_range: 0.0,
    bubble_duration: 0.0,
}));

#[allow(clippy::mut_from_ref)]
fn state() -> &'static mut State {
    unsafe { &mut *STATE.0.get() }
}

/// xorshift32. Deterministic from a fixed seed, so a given viewport always
/// produces the same field — which is what makes the simulation assertable in
/// a test rather than only observable on screen.
fn random(s: &mut State) -> f32 {
    s.seed ^= s.seed << 13;
    s.seed ^= s.seed >> 17;
    s.seed ^= s.seed << 5;
    (s.seed as f32) / 4_294_967_296.0
}

/// Set the simulation constants. Called once from JS before `resize`, so the
/// values live in one place — the component — rather than being duplicated
/// either side of the boundary.
#[no_mangle]
pub extern "C" fn configure(
    configured: f32,
    speed: f32,
    radius: f32,
    bubble_range: f32,
    bubble_duration: f32,
) {
    let s = state();

    s.configured = configured;
    s.speed = speed;
    s.radius = radius;
    s.bubble_range = bubble_range;
    s.bubble_duration = bubble_duration;
    s.seed = INITIAL_SEED;
}

/// How many particles a canvas of this size gets.
///
/// tsparticles scales the configured count by canvas area over a 1920x1080
/// reference (`ParticlesManager.js`), so the configured number is never the
/// rendered number. Its formula divides by `pixelRatio` squared against a
/// backing-store size, which cancels — leaving plain CSS-pixel area.
fn scaled_count(width: f32, height: f32, configured: f32) -> usize {
    let factor = (width * height) / (DENSITY_WIDTH * DENSITY_HEIGHT);
    let scaled = configured * factor;

    if scaled < 0.0 {
        return 0;
    }

    let n = scaled as usize;

    if n > MAX {
        MAX
    } else {
        n
    }
}

#[no_mangle]
pub extern "C" fn data_ptr() -> *const f32 {
    state().data.as_ptr()
}

#[no_mangle]
pub extern "C" fn stride() -> usize {
    STRIDE
}

#[no_mangle]
pub extern "C" fn count() -> usize {
    state().count
}

/// Reflow to a new canvas size. Existing particles keep their positions, so a
/// resize does not restart the field; only the shortfall is spawned.
#[no_mangle]
pub extern "C" fn resize(width: f32, height: f32) {
    let s = state();

    s.width = width;
    s.height = height;

    let next = scaled_count(width, height, s.configured);
    let mut i = s.count;

    while i < next {
        let o = i * STRIDE;

        s.data[o] = random(s) * width;
        s.data[o + 1] = random(s) * height;
        s.data[o + 2] = 0.0;
        s.data[o + 3] = 0.0;
        s.data[o + 4] = 0.0;

        i += 1;
    }

    s.count = next;
}

#[cfg(test)]
mod tests {
    use super::*;

    fn reset() {
        let s = state();

        s.count = 0;
        // configure re-seeds, so this is a full reset.
        configure(600.0, 0.25, 2.2, 175.0, 2.0);
    }

    #[test]
    fn scales_the_count_by_canvas_area() {
        // 1280x800 is 47.4% of the 1920x1080 reference.
        assert_eq!(scaled_count(1280.0, 800.0, 600.0), 296);
        // The reference area itself yields the configured number.
        assert_eq!(scaled_count(1920.0, 1080.0, 600.0), 600);
        // And a degenerate canvas yields nothing rather than panicking.
        assert_eq!(scaled_count(0.0, 0.0, 600.0), 0);
    }

    #[test]
    fn caps_the_count_at_the_buffer_size() {
        assert_eq!(scaled_count(100_000.0, 100_000.0, 600.0), MAX);
    }

    #[test]
    fn spawns_inside_the_canvas() {
        reset();
        resize(1280.0, 800.0);

        let s = state();

        assert_eq!(s.count, 296);

        for i in 0..s.count {
            let o = i * STRIDE;

            assert!((0.0..=1280.0).contains(&s.data[o]));
            assert!((0.0..=800.0).contains(&s.data[o + 1]));
        }
    }

    /// A resize should reflow the field, not restart it.
    #[test]
    fn keeps_existing_particles_across_a_resize() {
        reset();
        resize(1280.0, 800.0);

        let first = state().data[0];

        resize(1920.0, 1080.0);

        assert_eq!(state().data[0], first);
        assert_eq!(state().count, 600);
    }

    #[test]
    fn is_deterministic_from_its_seed() {
        reset();
        resize(1280.0, 800.0);
        let a = state().data[0];

        reset();
        resize(1280.0, 800.0);

        assert_eq!(state().data[0], a);
    }
}
