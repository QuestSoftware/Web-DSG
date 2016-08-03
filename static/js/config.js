require.config({
  baseUrl: '/static',
  paths: {
    jquery: 'library/jQuery/jquery-1.9.1.min',
    placeholder: 'library/jQuery/jquery.placeholder',
		cookie: 'library/jQuery/jquery.cookie',
		lazyload: 'library/jQuery/lazyload.min',
		validate: 'library/jQuery/validate-mod',
		matchHeight: 'library/jQuery/jquery.matchheight.min'
  },
  shims: {
		placeholder: {
			deps: ['jquery']
		},
		matchHeight: {
			deps: ['jquery']
		}
  }
});
