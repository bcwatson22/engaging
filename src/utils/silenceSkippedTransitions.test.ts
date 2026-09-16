import {
  isSkippedTransition,
  silenceSkippedTransitions,
} from './silenceSkippedTransitions';

const aborted = new DOMException(
  'Transition was aborted because of invalid state',
  'InvalidStateError',
);
const skipped = new DOMException('Transition was skipped', 'AbortError');

const rejection = (reason: unknown): Event =>
  Object.assign(new Event('unhandledrejection', { cancelable: true }), {
    reason,
  });

const thrown = (error: unknown): Event =>
  Object.assign(new Event('error', { cancelable: true }), { error });

type SetupOptions = {
  event: Event;
};

const setup = ({ event }: SetupOptions) => {
  const stop = silenceSkippedTransitions();
  const laterListener = vi.fn<(event: Event) => void>();

  window.addEventListener(event.type, laterListener);
  window.dispatchEvent(event);
  window.removeEventListener(event.type, laterListener);
  stop();

  return { laterListener };
};

describe('isSkippedTransition', () => {
  it('matches a transition aborted for invalid state', () => {
    expect(isSkippedTransition(aborted)).toBe(true);
  });

  it('matches a skipped transition', () => {
    expect(isSkippedTransition(skipped)).toBe(true);
  });

  it('ignores another error of the same name', () => {
    expect(
      isSkippedTransition(new DOMException('Something else', 'AbortError')),
    ).toBe(false);
  });

  it('ignores an error of another name', () => {
    expect(
      isSkippedTransition(
        new DOMException('Transition was skipped', 'NotFoundError'),
      ),
    ).toBe(false);
  });

  it('ignores anything that is not a DOMException', () => {
    expect(isSkippedTransition(new Error('Transition was skipped'))).toBe(
      false,
    );
  });
});

describe('silenceSkippedTransitions', () => {
  it('stops a skipped transition rejection reaching later listeners', () => {
    const event = rejection(aborted);
    const { laterListener } = setup({ event });

    expect(laterListener).toHaveBeenCalledTimes(0);
    expect(event.defaultPrevented).toBe(true);
  });

  it('stops a skipped transition thrown as an error', () => {
    const event = thrown(skipped);
    const { laterListener } = setup({ event });

    expect(laterListener).toHaveBeenCalledTimes(0);
    expect(event.defaultPrevented).toBe(true);
  });

  it('lets any other rejection through', () => {
    const event = rejection(new Error('boom'));
    const { laterListener } = setup({ event });

    expect(laterListener).toHaveBeenCalledTimes(1);
    expect(event.defaultPrevented).toBe(false);
  });

  it('stops listening once removed', () => {
    const stop = silenceSkippedTransitions();
    const laterListener = vi.fn<(event: Event) => void>();

    stop();
    window.addEventListener('unhandledrejection', laterListener);
    window.dispatchEvent(rejection(aborted));
    window.removeEventListener('unhandledrejection', laterListener);

    expect(laterListener).toHaveBeenCalledTimes(1);
  });
});
