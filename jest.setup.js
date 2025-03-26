import { TextEncoder, TextDecoder } from 'util';
import '@testing-library/jest-dom';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve([]), 
  })
);

global.scrollTo = jest.fn();