import onChange from 'on-change';
import * as yup from 'yup';
import _ from 'lodash';
import render from './view.js';

const validateAsync = async (field, state) => {
  const schema = yup
    .string()
    .required()
    .url('Ссылка должна быть валидным URL')
    .notOneOf(state.feeds, 'RSS уже существует');

  try {
    await schema.validate(field);
    return {};
  } catch (e) {
    // return _.keyBy(e.inner, 'path');
    const [err] = e.errors;
    return { errorContent: err };
  }
};

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

  elements.form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const inputValue = formData.get('url');
    const errors = await validateAsync(inputValue, state);
    state.form.errors = errors;
    if (_.isEmpty(errors)) {
      state.feeds.push(inputValue);
      state.form.valid = true;
    } else {
      state.form.valid = false;
    }
    // console.log(state.form);
  });
};

export default runApp;
