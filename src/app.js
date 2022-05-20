import onChange from 'on-change';
import * as yup from 'yup';
import render from './view.js';

const runApp = () => {
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

  const state = onChange(s, render(elements));

  elements.form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const inputValue = formData.get('url');

    const schema = yup
      .string()
      .required()
      .url('Ссылка должна быть валидным URL')
      .notOneOf(state.feeds, 'RSS уже существует');

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
