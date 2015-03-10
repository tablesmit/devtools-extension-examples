/* See license.txt for terms of usage */

"use strict";

const self = require("sdk/self");

const { Cu, Ci } = require("chrome");
const { Panel } = require("dev/panel.js");
const { Class } = require("sdk/core/heritage");
const { Tool } = require("dev/toolbox");
const { viewFor } = require("sdk/view/core");

/**
 * This object represents a new {@Toolbox} panel
 */
const MyPanel = Class(
/** @lends MyPanel */
{
  extends: Panel,

  label: "My Panel",
  tooltip: "My panel tooltip",
  icon: "./icon-16.png",
  url: "./myPanel.html",

  /**
   * Executed by the framework when an instance of this panel is created.
   * There is one instance of this panel per {@Toolbox}. The panel is
   * instantiated when selected in the toolbox for the first time.
   */
  initialize: function(options) {
    this.onMessage = this.onMessage.bind(this);
  },

  /**
   * Executed by the framework when the panel is destroyed.
   */
  dispose: function() {
  },

 /**
  * Executed by the framework when the panel content frame is
  * ready (document state == interactive).
  */
  onReady: function() {
    this.panelFrame = viewFor(this);

    // Get frame's message manager. Read more about message managers on MDN:
    // https://developer.mozilla.org/en-US/Firefox/Multiprocess_Firefox/The_message_manager
    const { messageManager } = this.panelFrame.frameLoader;
    messageManager.addMessageListener("message/from/content",
      this.onMessage);

    // Load frame script with content API for receiving
    // and sending messages.
    let url = self.data.url("frame-script.js");
    messageManager.loadFrameScript(url, false);

    // Send test message to the content
    this.postContentMessage("<message-id>", "Hello from chrome scope!");
  },

  // Chrome <-> Content Communication

  onMessage: function(message) {
    const { type, data } = message.data;

    console.log("Message from content: " + data);
  },

  postContentMessage: function(type, data) {
    let { messageManager } = this.panelFrame.frameLoader;
    messageManager.sendAsyncMessage("message/from/chrome", {
      type: type,
      data: data,
    });
  },
});

const myTool = new Tool({
  name: "MyTool",
  panels: {
    myPanel: MyPanel
  }
});
