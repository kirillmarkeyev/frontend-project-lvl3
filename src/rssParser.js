const getParsedRSS = (content) => {
  const parser = new DOMParser();
  const parsedContent = parser.parseFromString(content, 'application/xml');

  if (parsedContent.querySelector('parsererror')) {
    throw new Error('notValidRss');
  }

  const titleEl = parsedContent.querySelector('title');
  const title = titleEl.textContent;
  const descriptionEl = parsedContent.querySelector('description');
  const description = descriptionEl.textContent;

  const feed = { title, description };

  const items = parsedContent.querySelectorAll('item');
  const posts = [...items].map((item) => {
    const itemTitleEl = item.querySelector('title');
    const itemTitle = itemTitleEl.textContent;

    const itemDescriptionEl = item.querySelector('description');
    const itemDescription = itemDescriptionEl.textContent;

    const itemLinkEl = item.querySelector('link');
    const itemLink = itemLinkEl.textContent;

    return { title: itemTitle, description: itemDescription, link: itemLink };
  });
  return { feed, posts };
};

export default getParsedRSS;
