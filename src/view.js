/* eslint-disable no-param-reassign */

import { isEmpty } from 'lodash';

const render = (elements, i18nextInstance) => (path, value) => {
  switch (path) {
    case 'form.errors':
      if (isEmpty(value)) {
        return;
      }
      // console.log('Errors has changed!!!');
      elements.feedback.textContent = '';
      elements.feedback.textContent = i18nextInstance.t(`errors.${value.key}`);
      elements.feedback.classList.remove('text-success');
      elements.feedback.classList.add('text-danger');

      elements.input.classList.add('is-invalid');
      break;

    case 'feeds':
      // console.log('Feeds has changed!!!');
      elements.feedback.classList.remove('text-danger');
      elements.feedback.classList.add('text-success');

      elements.input.classList.remove('is-invalid');

      elements.feedback.textContent = '';
      elements.feedback.textContent = i18nextInstance.t('success.rss');
      elements.form.reset();
      elements.input.focus();
      break;

    default:
      break;
  }
};

export default render;
