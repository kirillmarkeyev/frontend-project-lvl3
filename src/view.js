/* eslint-disable no-param-reassign */

const render = (elements) => (path, value) => {
  switch (path) {
    case 'form.errors':
      elements.feedback.textContent = '';
      elements.feedback.textContent = value.errorContent;
      elements.feedback.classList.remove('text-success');
      elements.feedback.classList.add('text-danger');

      elements.input.classList.add('is-invalid');
      break;

    case 'feeds':
      elements.feedback.classList.remove('text-danger');
      elements.feedback.classList.add('text-success');

      elements.input.classList.remove('is-invalid');

      elements.feedback.textContent = '';
      elements.feedback.textContent = 'RSS успешно загружен';
      elements.form.reset();
      elements.input.focus();
      break;

    default:
      break;
  }
};

export default render;
