import onChange from 'on-change';
import * as yup from 'yup';
import i18next from 'i18next';
import resources from './locales/index.js';
import render from './view.js';

const runApp = () => {
  const defaultLanguage = 'ru';
  const i18nextInstance = i18next.createInstance();
  i18nextInstance.init({
    lng: defaultLanguage,
    debug: false,
    resources,
  });

  const s = {
    form: {
      valid: null,
      errors: {},
    },
    feeds: [],
  };

  const input = document.querySelector('#url-input');
  const form = document.querySelector('.rss-form');
  const feedback = document.querySelector('.feedback');

  const elements = { input, form, feedback };

  const state = onChange(s, render(elements, i18nextInstance));

  elements.form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const inputValue = formData.get('url');

    const schema = yup
      .string()
      .required()
      .url(i18nextInstance.t('errors.url'))
      .notOneOf(state.feeds, i18nextInstance.t('errors.notOneOf'));

    schema.validate(inputValue)
      .then(() => {
        state.form.errors = {};
        state.form.valid = true;
        state.feeds.push(inputValue);
      })
      .catch((e) => {
        const [err] = e.errors;
        const data = { errorContent: err };
        state.form.errors = data;
        state.form.valid = false;
      });
  });
};

export default runApp;
