let getWindowWidth = () => {
  return window.innerWidth ||
    document.documentElement.clientWidth ||
    document.body.clientWidth;
};

class MobileUtil {
  initialize() {
    this.breakpoint = 500;
  }

  isMobile(breakpoint = this.breakpoint) {
    return getWindowWidth() < breakpoint;
  }
}

export default new MobileUtil;
