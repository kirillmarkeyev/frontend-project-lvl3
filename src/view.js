/* eslint-disable no-param-reassign */

import _ from 'lodash';

const handleProcessState = (elements, i18nextInstance, processState) => {
  switch (processState) {
    case 'filling':
      elements.submit.disabled = false;
      break;

    case 'sending':
      elements.submit.disabled = true;
      elements.feedback.textContent = '';
      break;

    case 'added':
      elements.submit.disabled = false;

      elements.feedback.classList.remove('text-danger');
      elements.feedback.classList.add('text-success');

      elements.input.classList.remove('is-invalid');

      elements.feedback.textContent = '';
      elements.feedback.textContent = i18nextInstance.t('success.rss');
      elements.form.reset();
      elements.input.focus();
      break;

    case 'error':
      elements.submit.disabled = false;
      elements.input.focus();
      break;

    default:
      throw new Error(`Unknown process state: ${processState}`);
  }
};

const renderErrors = (elements, i18nextInstance, errors) => {
  if (_.isEmpty(errors)) {
    return;
  }
  elements.feedback.classList.remove('text-success');
  elements.feedback.classList.add('text-danger');
  elements.input.classList.add('is-invalid');

  elements.feedback.textContent = '';
  elements.feedback.textContent = i18nextInstance.t(`errors.${errors.key}`);
};

const render = (elements, i18nextInstance) => (path, value) => {
  switch (path) {
    case 'form.processState':
      handleProcessState(elements, i18nextInstance, value);
      break;

    case 'form.errors':
      renderErrors(elements, i18nextInstance, value);
      break;

    default:
      break;
  }
};

export default render;
