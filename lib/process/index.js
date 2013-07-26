/**
 * Emulate browserify envirement
 */

if (!window.process) window.process = {};
if (!process.browser) process.browser = true;

/**
 * Emulate browserify envirement
 */

if (!process.nextTick) {
  require('./set-immediate');
  process.nextTick = setImmediate;
}
