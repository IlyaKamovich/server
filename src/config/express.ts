import express from 'express';

module.exports = (app: any) => {
  app.use(require('morgan')('dev'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(require('cors')());
};
