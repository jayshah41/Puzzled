import { useCallback } from 'react';

const useSaveContent = () => {
  const saveContent = useCallback((contentData) => {
    contentData.forEach(item => {
      fetch('/api/proxy/editable-content/update/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(item),
      })
        .then(response => response.json())
        .then(data => {
        })
        .catch(error => {
          console.error(`There was an error saving ${item.section}`, error);
        });
    });
  }, []);

  return saveContent;
};

export default useSaveContent;