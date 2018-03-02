export default function afterInitialRender({ firstTime, use }) {
  if (!firstTime) {
    return use;
  }
}
