"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var _reactNative = require("react-native");
var _reactNativeReanimated = _interopRequireWildcard(require("react-native-reanimated"));
var _CacheManager = _interopRequireDefault(require("./CacheManager"));
var _helpers = require("./helpers");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
const AnimatedImage = _reactNativeReanimated.default.Image;
const AnimatedView = _reactNativeReanimated.default.View;
const defaultProps = {
  onError: () => {}
};
function useIsComponentMounted() {
  const isMounted = (0, _react.useRef)(false);
  // @ts-ignore
  (0, _react.useEffect)(() => {
    isMounted.current = true;
    return () => isMounted.current = false;
  }, []);
  return isMounted;
}
function useStateIfMounted(initialState) {
  const isComponentMounted = useIsComponentMounted();
  const [state, setState] = _react.default.useState(initialState);
  const newSetState = (0, _react.useCallback)(value => {
    if (isComponentMounted.current) {
      setState(value);
    }
  }, [isComponentMounted]);
  return [state, newSetState];
}
const CachedImage = props => {
  const [error, setError] = useStateIfMounted(false);
  const [uri, setUri] = useStateIfMounted(undefined);
  const {
    source: propsSource,
    options: propsOptions
  } = props;
  const currentSource = (0, _react.useRef)(propsSource);
  const animatedImage = (0, _reactNativeReanimated.useSharedValue)(0);
  const animatedThumbnailImage = (0, _reactNativeReanimated.useSharedValue)(0);
  const animatedLoadingImage = (0, _reactNativeReanimated.useSharedValue)(1);
  const imageSourceAnimatedStyle = (0, _reactNativeReanimated.useAnimatedStyle)(() => {
    return {
      opacity: animatedImage.value
    };
  });
  const thumbnailSourceAnimatedStyle = (0, _reactNativeReanimated.useAnimatedStyle)(() => {
    return {
      opacity: animatedThumbnailImage.value
    };
  });
  const loadingImageAnimatedStyle = (0, _reactNativeReanimated.useAnimatedStyle)(() => {
    return {
      opacity: animatedLoadingImage.value
    };
  });
  (0, _react.useEffect)(() => {
    if ((0, _helpers.isRemoteImage)(propsSource)) {
      load(props).catch();
    } else {
      setUri(propsSource);
    }
    if (propsSource !== currentSource.current) {
      currentSource.current = propsSource;
      resetAnimations();
    }
    /* eslint-disable react-hooks/exhaustive-deps */
  }, [propsSource, propsOptions]);
  const load = async _ref => {
    let {
      maxAge,
      noCache = false,
      onError,
      options = {},
      source
    } = _ref;
    if (source) {
      try {
        const path = await _CacheManager.default.get(source, options, noCache, maxAge).getPath();
        if (path) {
          setUri(path);
          setError(false);
        } else {
          setUri(undefined);
          setError(true);
          onError({
            nativeEvent: {
              error: new Error('Could not load image')
            }
          });
        }
      } catch (e) {
        setUri(undefined);
        setError(true);
        onError({
          nativeEvent: {
            error: e
          }
        });
      }
    }
  };
  const resetAnimations = () => {
    animatedLoadingImage.value = 1;
    animatedThumbnailImage.value = 0;
    animatedImage.value = 0;
  };
  const onThumbnailLoad = () => {
    animatedLoadingImage.value = (0, _reactNativeReanimated.withTiming)(0, {}, () => {
      var _CacheManager$config;
      animatedThumbnailImage.value = (0, _reactNativeReanimated.withTiming)(1, {
        duration: props.thumbnailAnimationDuration === 0 ? 0 : props.thumbnailAnimationDuration || (_CacheManager.default === null || _CacheManager.default === void 0 || (_CacheManager$config = _CacheManager.default.config) === null || _CacheManager$config === void 0 ? void 0 : _CacheManager$config.thumbnailAnimationDuration) || 100
      });
    });
  };
  const onImageError = () => {
    if (props.onError) {
      props.onError();
    }
    setError(true);
  };
  const onImageLoad = e => {
    var _CacheManager$config2;
    if (props.onLoad) {
      props.onLoad(e);
    }
    animatedImage.value = (0, _reactNativeReanimated.withTiming)(1, {
      duration: props.sourceAnimationDuration === 0 ? 0 : props.sourceAnimationDuration || (_CacheManager.default === null || _CacheManager.default === void 0 || (_CacheManager$config2 = _CacheManager.default.config) === null || _CacheManager$config2 === void 0 ? void 0 : _CacheManager$config2.sourceAnimationDuration) || 100
    });
  };
  const {
    accessibilityHint,
    accessibilityHintLoadingImage,
    accessibilityHintThumbnail,
    accessibilityLabel,
    accessibilityLabelLoadingImage,
    accessibilityLabelThumbnail,
    accessibilityRole,
    accessibilityRoleLoadingSource,
    accessibilityRoleThumbnail,
    blurRadius,
    imageStyle,
    loadingImageComponent: LoadingImageComponent,
    loadingImageStyle = props.style,
    loadingSource,
    resizeMode,
    style,
    testID,
    thumbnailSource,
    ...rest
  } = props;
  const isImageReady = (0, _react.useMemo)(() => !!uri, [uri, propsSource]);
  const imageSource = (0, _react.useMemo)(() => {
    if (error || !uri) {
      return loadingSource;
    }
    if ((0, _helpers.isRemoteImage)(propsSource) || !(0, _helpers.isImageWithRequire)(propsSource)) {
      return {
        uri: (0, _helpers.isAndroid)() ? `file://${uri}` : uri
      };
    }

    /* If reached here it means it's not http image or local path eg:"/data/user/0/com.reactnativeimagecacheexample/.."
     * so its local image with Require method
     */
    return uri;
  }, [uri, error, propsSource]);
  return /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: [styles.container, style],
    testID: testID
  }, !isImageReady && (LoadingImageComponent ? /*#__PURE__*/_react.default.createElement(AnimatedView, {
    style: [styles.loadingImageStyle, loadingImageAnimatedStyle]
  }, /*#__PURE__*/_react.default.createElement(LoadingImageComponent, null)) : /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: [styles.loadingImageStyle]
  }, loadingSource && /*#__PURE__*/_react.default.createElement(AnimatedImage, {
    accessibilityHint: accessibilityHintLoadingImage,
    accessibilityLabel: accessibilityLabelLoadingImage,
    accessibilityRole: accessibilityRoleLoadingSource || 'image',
    accessible: true,
    resizeMode: resizeMode || 'contain',
    style: [loadingImageAnimatedStyle, loadingImageStyle],
    source: loadingSource
  }))), thumbnailSource && /*#__PURE__*/_react.default.createElement(AnimatedImage, {
    accessibilityHint: accessibilityHintThumbnail,
    accessibilityLabel: accessibilityLabelThumbnail,
    accessibilityRole: accessibilityRoleThumbnail || 'image',
    accessible: true,
    blurRadius: blurRadius || _CacheManager.default.config.blurRadius,
    onLoad: onThumbnailLoad,
    resizeMode: resizeMode || 'contain',
    source: {
      uri: thumbnailSource,
      ...propsOptions
    },
    style: [style, thumbnailSourceAnimatedStyle]
  }), imageSource && /*#__PURE__*/_react.default.createElement(AnimatedImage, _extends({}, rest, {
    accessibilityHint: accessibilityHint,
    accessibilityLabel: accessibilityLabel,
    accessibilityRole: accessibilityRole || 'image',
    accessible: true,
    onError: onImageError,
    onLoad: onImageLoad,
    onLoadEnd: props.onLoadEnd,
    resizeMode: resizeMode || 'contain'
    // @ts-ignore, reanimated image doesn't have tintColor typing
    ,
    tintColor: props.tintColor
    // @ts-ignore
    ,
    source: imageSource
    // @ts-ignore
    ,
    style: [styles.imageStyle, imageSourceAnimatedStyle, imageStyle]
  })));
};
const styles = _reactNative.StyleSheet.create({
  container: {
    backgroundColor: 'transparent'
  },
  imageStyle: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0
  },
  loadingImageStyle: {
    alignItems: 'center',
    alignSelf: 'center',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0
  }
});
CachedImage.defaultProps = defaultProps;
var _default = CachedImage;
exports.default = _default;
//# sourceMappingURL=CachedImage.js.map