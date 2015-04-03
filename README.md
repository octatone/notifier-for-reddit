# Notifier for Reddit
Desktop notifications for for new messages to your reddit inbox.

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