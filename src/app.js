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
      errors: {},
      urls: [],
    },
    feeds: [],
    posts: [],
    visitedPostsId: new Set(), // https://ru.hexlet.io/courses/js_collections/lessons/set/theory_unit
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

  const state = onChange(s, render(s, elements, i18nextInstance));

  elements.form.addEventListener('submit', (event) => {
    event.preventDefault();

    state.form.processState = 'sending';

    const formData = new FormData(event.target);
    const inputValue = formData.get('url');

    const schema = yup
      .string()
      .required()
      .url()
      .notOneOf(state.form.urls);

    schema.validate(inputValue)
      .then(() => {
        console.log('Validation is OK!!!');
        return axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(inputValue)}`)
          .then((response) => {
            console.log('Download OK!!!');
            return getParsedRSS(response.data.contents);
          })
          .then((parsedContent) => {
            console.log('Parsing is OK!');
            state.form.urls.unshift(inputValue);
            state.feeds.unshift(parsedContent.feed);
            state.posts = parsedContent.posts.concat(state.posts);
            state.form.errors = {};
            state.form.processState = 'added';
          })
          .catch((err) => {
            state.form.errors = { key: err.message };
            state.form.processState = 'error';
            console.log('Parsing error!!!');
          });
      })
      .catch((err) => {
        const [key] = err.errors;
        state.form.errors = key;
        state.form.processState = 'error';
      });
    // console.log(state);
  });

  elements.posts.addEventListener('click', (event) => {
    const currentId = event.target.dataset.id;
    state.visitedPostsId.add(currentId);
    // console.log(state);
  });

  // https://ru.hexlet.io/challenges/js_dom_progress_exercise
  const updateRssPosts = () => {
    state.form.urls.forEach((url) => {
      axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`)
        .then((response) => {
          console.log('Updating is OK!!!');
          return getParsedRSS(response.data.contents);
        })
        .then((parsedContent) => {
          const { posts: newPosts } = parsedContent;
          const addedPostsLinks = state.posts.map((post) => post.link);
          const addedNewPosts = newPosts.filter((post) => !addedPostsLinks.includes(post.link));
          state.posts = addedNewPosts.concat(state.posts);
        })
        .catch((err) => {
          throw err;
        });
    });
    setTimeout(() => updateRssPosts(), 5000);
  };
  updateRssPosts();
};

export default runApp;
