const style = document.createElement('style');
style.textContent = `
  body {
    font-family: system-ui, sans-serif;
    background-color: #121212;
    color: #ffffff;
    padding: 20px;
    margin: 0;
    text-align: center;
  }

  #editor {
    max-width: 600px;
    margin: auto;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding-bottom: 200px;
  }

  section {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: center;
    justify-content: center;
  }

  input, select, button {
    font-size: 1rem;
    padding: 0.5rem;
    border-radius: 6px;
    border: none;
  }

  button {
    background-color: #333;
    color: white;
    cursor: pointer;
  }

  pre {
    background: #1e1e1e;
    padding: 10px;
    color: #ccc;
    font-size: 0.85rem;
    overflow-x: auto;
    text-align: left;
    border-radius: 5px;
    max-height: 300px;
    white-space: pre-wrap;
  }
`;
document.head.appendChild(style);
