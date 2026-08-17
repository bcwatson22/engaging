import { act, renderHook } from '@testing-library/react';
import type { ChangeEvent, FocusEvent } from 'react';

import {
  emailPattern,
  honeypotField,
  minMessage,
  patternMessage,
  rejectedMessage,
  type TValues,
} from '@/constants/contact';
import { sendContact, type TResult } from '@/data/functions/sendContact';

import { useContact, type TControl } from './useContact';

vi.mock('@/data/functions/sendContact', () => ({
  sendContact:
    vi.fn<typeof import('@/data/functions/sendContact').sendContact>(),
}));

type SetupOptions = {
  result: TResult;
};

const filled: TValues = {
  name: 'Tom Tollafield',
  email: 'tom@example.com',
  message: 'I would like to talk to you about a role.',
};

/* The hook validates through a real form — checkValidity, namedItem, focusing
   controls — so the test supplies one carrying the same constraints the
   component renders. Building it here rather than rendering the component
   keeps this a test of the hook and not of its markup. */
const buildForm = (): HTMLFormElement => {
  const form = document.createElement('form');
  form.noValidate = true;

  const name = document.createElement('input');
  name.name = 'name';
  name.type = 'text';
  name.required = true;

  const email = document.createElement('input');
  email.name = 'email';
  email.type = 'email';
  email.required = true;
  email.pattern = emailPattern;

  const message = document.createElement('textarea');
  message.name = 'message';
  message.required = true;
  message.minLength = minMessage;

  const honeypot = document.createElement('input');
  honeypot.name = honeypotField;
  honeypot.type = 'text';

  form.append(name, email, message, honeypot);
  document.body.append(form);

  return form;
};

const setup = (options?: Partial<SetupOptions>) => {
  const setupOptions: SetupOptions = {
    result: { outcome: 'sent' },
    ...options,
  };

  vi.mocked(sendContact).mockResolvedValue(setupOptions.result);

  const rendered = renderHook(() => useContact());
  const form = buildForm();

  rendered.result.current.formRef.current = form;

  const control = (field: string): TControl =>
    form.elements.namedItem(field) as TControl;

  /* Mirrors what a controlled input does: the DOM value changes, then the
     hook is told. Keeps the hook's state and the form's validity in step,
     which is the pairing the component achieves by binding them. */
  const type = (field: string, value: string) => {
    const target = control(field);
    target.value = value;

    act(() =>
      rendered.result.current.onChange({
        target,
      } as ChangeEvent<TControl>),
    );
  };

  const blur = (field: string) =>
    act(() =>
      rendered.result.current.onBlur({
        target: control(field),
      } as FocusEvent<TControl>),
    );

  const complete = () =>
    Object.entries(filled).forEach(([field, value]) => type(field, value));

  const submit = async () =>
    await act(async () => {
      rendered.result.current.submit(new FormData(form));
    });

  return { ...rendered, form, control, type, blur, complete, submit };
};

describe('useContact', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.replaceChildren();
  });

  it('starts with nothing typed, nothing wrong and nothing to report', () => {
    const {
      result: { current },
    } = setup();

    expect(current.values).toEqual({ name: '', email: '', message: '' });
    expect(current.errors).toEqual({});
    expect(current.outcome).toBe('idle');
    expect(current.isPending).toBe(false);
  });

  describe('onChange', () => {
    it('records what was typed', () => {
      const { result, type } = setup();

      type('name', filled.name);

      expect(result.current.values.name).toBe(filled.name);
    });

    it('says nothing about a field that has not been left yet', () => {
      const { result, type } = setup();

      type('email', 'tom@');

      expect(result.current.errors.email).toBeUndefined();
    });

    it('revalidates on every keystroke once the field has been left', () => {
      const { result, type, blur } = setup();

      type('email', 'tom@');
      blur('email');

      expect(result.current.errors.email).toBeTruthy();

      type('email', filled.email);

      expect(result.current.errors.email).toBe('');
    });
  });

  describe('onBlur', () => {
    it('marks a required field left empty', () => {
      const { result, blur } = setup();

      blur('name');

      expect(result.current.errors.name).toBeTruthy();
    });

    it('leaves a valid field unmarked', () => {
      const { result, type, blur } = setup();

      type('name', filled.name);
      blur('name');

      expect(result.current.errors.name).toBe('');
    });

    it('explains an address the service would refuse, in place of the browser wording', () => {
      const { result, type, blur } = setup();

      type('email', 'tom@example');
      blur('email');

      expect(result.current.errors.email).toBe(patternMessage);
    });
  });

  describe('submitting an invalid form', () => {
    it('sends nothing', async () => {
      const { submit } = setup();

      await submit();

      expect(sendContact).not.toHaveBeenCalled();
    });

    it('marks every bad field, including ones never visited', async () => {
      const { result, submit } = setup();

      await submit();

      expect(result.current.errors.name).toBeTruthy();
      expect(result.current.errors.message).toBeTruthy();
    });

    it('stays idle, since nothing was reported back', async () => {
      const { result, submit } = setup();

      await submit();

      expect(result.current.outcome).toBe('idle');
    });

    it('moves focus to the first field in declared order, not document order', async () => {
      const { control, submit } = setup();

      await submit();

      expect(document.activeElement).toBe(control('name'));
    });
  });

  describe('submitting a valid form', () => {
    it('sends what was typed, with the honeypot and the render time', async () => {
      const { complete, submit } = setup();

      complete();
      await submit();

      expect(sendContact).toHaveBeenNthCalledWith(1, {
        ...filled,
        [honeypotField]: '',
        renderedAt: expect.any(Number),
      });
    });

    it('reports the outcome the service gave', async () => {
      const { result, complete, submit } = setup();

      complete();
      await submit();

      expect(result.current.outcome).toBe('sent');
    });

    it('empties the fields once sent', async () => {
      const { result, complete, submit } = setup();

      complete();
      await submit();

      expect(result.current.values).toEqual({
        name: '',
        email: '',
        message: '',
      });
    });

    it('forgets the fields were touched, so emptying them marks nothing', async () => {
      const { result, complete, blur, submit } = setup();

      complete();
      blur('name');
      await submit();

      expect(result.current.errors).toEqual({});
    });

    it('keeps what was typed when the send is refused', async () => {
      const { result, complete, submit } = setup({
        result: { outcome: 'limited' },
      });

      complete();
      await submit();

      expect(result.current.outcome).toBe('limited');
      expect(result.current.values).toEqual(filled);
    });

    it('marks the fields the service rejected', async () => {
      const { result, complete, submit } = setup({
        result: { outcome: 'invalid', fields: ['email'] },
      });

      complete();
      await submit();

      expect(result.current.errors.email).toBe(rejectedMessage);
    });

    it('reports a failure the service never answered', async () => {
      const { result, complete, submit } = setup({
        result: { outcome: 'failed' },
      });

      complete();
      await submit();

      expect(result.current.outcome).toBe('failed');
    });
  });
});
