import { TotAdminPage } from './app.po';

describe('tot-admin App', () => {
  let page: TotAdminPage;

  beforeEach(() => {
    page = new TotAdminPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!');
  });
});
