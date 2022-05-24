import onChange from 'on-change';
import * as yup from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import resources from './locales/index.js';
import render from './view.js';
import getParsedRSS from './rssParser.js';

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
    content: [],
  };

  yup.setLocale({
    string: {
      url: () => ({ key: 'notValidUrl' }),
    },
    mixed: {
      notOneOf: () => ({ key: 'notOneOf' }),
    },
  });

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
      .url()
      .notOneOf(state.feeds);

    schema.validate(inputValue)
      .then(() => {
        console.log('Validation is OK!!!');
        return axios(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(inputValue)}`)
          .then((response) => {
            console.log('Download OK!!!');
            return getParsedRSS(response.data.contents);
          })
          .then((parsedContent) => {
            console.log('Parsing is OK!');
            state.feeds.push(inputValue);
            state.content.push(parsedContent);
            state.form.errors = {};
            state.form.valid = true;
          })
          .catch((err) => {
            state.form.errors = { key: err.message };
            state.form.valid = false;
            console.log('Parsing error!!!');
          });
      })
      .catch((err) => {
        const [key] = err.errors;
        state.form.errors = key;
        state.form.valid = false;
      });
    console.log(state);
  });
};

export default runApp;
