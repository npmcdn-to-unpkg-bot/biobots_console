requirejs.config({
    baseUrl: '',
    paths: {
        react: 'https://npmcdn.com/react@15.3.1/dist/react',
        reactDom: 'https://npmcdn.com/react-dom@15.3.1/dist/react-dom',
        jquery: 'vendor/jquery-3.1.0.min',
        d3: 'https://d3js.org/d3.v4.min',
        index: 'app/index'
    }
});

requirejs(['index'], function(index) {
  index.load()
});