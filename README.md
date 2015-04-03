# Notifier for Reddit
A Chrome extension that displays desktop notifications for new messages to your reddit inbox.

Available on the [chrome web store](https://chrome.google.com/webstore/detail/notifier-for-reddit/odmoedfabaohbdoiolgfhedcbfpcindh).

## Development
Fork this repo, pull it down

```
npm install
gulp develop
```

Load `./extension` as an unpacked extension in `chrome://extensions`

###

View code for the browser action popover is writtin as common js React components.
The source for the views lives in `./src`. The `develop` gulp task will watch for changes
in the `./src` directory and build to `./extension/js`.

You can also manually run `gulp scripts` to build files in `./src` to `./extension/js`.