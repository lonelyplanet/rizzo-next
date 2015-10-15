let mark = (name) => {
  if (window.performance && window.performance.mark) {
    window.performance.mark(name);
  }
};

let measure = (name, start, end) => {
  if (window.performance && window.performance.measure) {
    window.performance.measure(name, start, end);
    let entries;
    return (entries = window.performance.getEntriesByName(name))[entries.length - 1];
  }
};

export {
  mark, measure
};
