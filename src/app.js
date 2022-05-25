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
      processState: 'filling', // filling, sending, added, error
      valid: null, // возможно, удалить
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
  const submit = document.querySelector('button[type="submit"]');
  const feeds = document.querySelector('.feeds');
  const posts = document.querySelector('.posts');

  const elements = {
    input,
    form,
    feedback,
    submit,
    feeds,
    posts,
  };

  const state = onChange(s, render(elements, i18nextInstance));

  elements.form.addEventListener('submit', (event) => {
    event.preventDefault();

    state.form.processState = 'sending';

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
            state.feeds.unshift(inputValue);
            state.content.unshift(parsedContent);
            state.form.errors = {};
            state.form.valid = true;
            state.form.processState = 'added';
          })
          .catch((err) => {
            state.form.errors = { key: err.message };
            state.form.valid = false;
            state.form.processState = 'error';
            console.log('Parsing error!!!');
          });
      })
      .catch((err) => {
        const [key] = err.errors;
        state.form.errors = key;
        state.form.valid = false;
        state.form.processState = 'error';
      });
    console.log(state);
  });
};

export default runApp;
