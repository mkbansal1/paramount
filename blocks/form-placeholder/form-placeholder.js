/**
 * Form placeholder block.
 *
 * The live page embeds a third-party (Salesforce) contact form that can't be
 * migrated. This block preserves the section — heading + "stay connected" text +
 * social links — and renders a static, non-functional contact-form placeholder
 * in place of the embed.
 *
 * Authored structure (.plain.html): a single cell with the heading, intro text,
 * and any social links.
 */
export default function decorate(block) {
  const inner = block.querySelector(':scope > div > div') || block;
  inner.classList.add('form-placeholder-content');

  const form = document.createElement('div');
  form.className = 'form-placeholder-form';
  ['Name', 'Email', 'Company'].forEach((label) => {
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = label;
    input.disabled = true;
    form.append(input);
  });
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.disabled = true;
  btn.textContent = 'Submit';
  btn.className = 'button';
  form.append(btn);

  inner.append(form);
}
