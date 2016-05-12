import React from "react";
import radium from "radium";
// import color from "color";
import settings from "../../../sass/settings.json";

const styles = {
  base: {
    appearance: "none",
    backfaceVisibility: "hidden",
    border: 0,
    borderRadius: 0,
    cursor: "pointer",
    display: "inline-block",
    fontWeight: 600,
    lineHeight: 1,
    outline: "none",
    paddingLeft: "3rem",
    paddingRight: "3rem",
    textAlign: "center",
    textDecoration: "none",
    textTransform: "uppercase",
    transition: "color 400ms, border 400ms, background-color 400ms",
    verticalAlign: "middle",
    whiteSpace: "nowrap",

    ":hover": {
      textDecoration: "none",
    },
    ":focus": {
      textDecoration: "none",
    },
    ":active": {
      textDecoration: "none",
    },
  },

  color: {
    blue: {
      backgroundColor: settings.color.blue,
      color: settings.color.white,

      ":hover": {
        backgroundColor: settings.color.blue, // + 15
        color: settings.color.white,
      },
      ":focus": {
        backgroundColor: settings.color.blue, // + 15
        color: settings.color.white,
      },
      ":active": {
        backgroundColor: settings.color.blue, // + 15
        color: settings.color.white,
      },
    },

    white: {
      backgroundColor: settings.color.white,
      color: settings.color.blue,

      ":hover": {
        backgroundColor: settings.color.white,
        color: settings.color.blue, // + 30
      },
      ":focus": {
        backgroundColor: settings.color.white,
        color: settings.color.blue, // + 30
      },
      ":active": {
        backgroundColor: settings.color.white,
        color: settings.color.blue, // + 30
      },
    },
  },

  size: {
    tiny: {},
    small: {},
    medium: {
      fontSize: "1.2rem",
    },
    large: {},
    huge: {},
  },

  height: {
    short: {
      paddingBottom: "1rem",
      paddingTop: "1.2rem",
    },
    normal: {
      paddingBottom: "1.4rem",
      paddingTop: "1.8rem",
    },
    tall: {
      paddingBottom: "2rem",
      paddingTop: "2.3rem",
    },
  },

  type: {
    rounded: {
      borderRadius: "2.2rem",
    },
    full: {
      display: "block",
      width: "100%",
    },
  },
};

/**
 * Button component
 *
 * @usage
 * <Button href="/foo">Bar</Button>
 */
function Button({ href, children, onClick, color, size, height, rounded, full }) {
  const Element = href ? "a" : "button";
  const role = Element === "a" ? "button" : "";

  const style = [styles.base];

  if (color) {
    style.push(styles.color[color]);
  }

  if (size) {
    style.push(styles.size[size]);
  }

  if (height) {
    style.push(styles.height[height]);
  }

  if (rounded) {
    style.push(styles.type.rounded);
  }

  if (full) {
    style.push(styles.type.full);
  }

  return (
    <Element
      className="Button"
      style={style}
      href={href}
      onClick={onClick}
      role={role}
    >
        {children}
    </Element>
  );
}

Button.propTypes = {
  /**
   * Pass an href prop to make the Button an `a` element instead of a `button`
   */
  href: React.PropTypes.string,

  /**
   * Content for the button
   */
  children: React.PropTypes.node.isRequired,

  /**
   * Function to run when the button is clicked
   */
  onClick: React.PropTypes.func,

  /**
   * Color of the button
   */
  color: React.PropTypes.oneOf([
    "blue",
    "white",
  ]),

  /**
   * Size of the button
   */
  size: React.PropTypes.oneOf([
    "tiny",
    "small",
    "medium",
    "large",
    "huge",
  ]),

  /**
   * Height of the button
   */
  height: React.PropTypes.oneOf([
    "short",
    "normal",
    "tall",
  ]),

  /**
   * Use a rounded button
   */
  rounded: React.PropTypes.bool,

  /**
   * Allow button to span available width
   */
  full: React.PropTypes.bool,
};

Button.defaultProps = {
  href: "",

  onClick: null,

  color: "blue",

  size: "medium",

  height: "normal",

  rounded: true,

  full: false,

  children: "Button",
};

export default radium(Button);
