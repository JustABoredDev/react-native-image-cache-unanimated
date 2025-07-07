function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import CacheManager from './CacheManager';
import { isAndroid, isImageWithRequire, isRemoteImage } from './helpers';
const AnimatedImage = Animated.Image;
const AnimatedView = Animated.View;
const defaultProps = {
  onError: () => {}
};
function useIsComponentMounted() {
  const isMounted = useRef(false);
  // @ts-ignore
  useEffect(() => {
    isMounted.current = true;
    return () => isMounted.current = false;
  }, []);
  return isMounted;
}
function useStateIfMounted(initialState) {
  const isComponentMounted = useIsComponentMounted();
  const [state, setState] = React.useState(initialState);
  const newSetState = useCallback(value => {
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
  const currentSource = useRef(propsSource);
  const animatedImage = useSharedValue(0);
  const animatedThumbnailImage = useSharedValue(0);
  const animatedLoadingImage = useSharedValue(1);
  const imageSourceAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: animatedImage.value
    };
  });
  const thumbnailSourceAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: animatedThumbnailImage.value
    };
  });
  const loadingImageAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: animatedLoadingImage.value
    };
  });
  useEffect(() => {
    if (isRemoteImage(propsSource)) {
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
        const path = await CacheManager.get(source, options, noCache, maxAge).getPath();
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
    animatedLoadingImage.value = withTiming(0, {}, () => {
      var _CacheManager$config;
      animatedThumbnailImage.value = withTiming(1, {
        duration: props.thumbnailAnimationDuration === 0 ? 0 : props.thumbnailAnimationDuration || (CacheManager === null || CacheManager === void 0 || (_CacheManager$config = CacheManager.config) === null || _CacheManager$config === void 0 ? void 0 : _CacheManager$config.thumbnailAnimationDuration) || 100
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
    animatedImage.value = withTiming(1, {
      duration: props.sourceAnimationDuration === 0 ? 0 : props.sourceAnimationDuration || (CacheManager === null || CacheManager === void 0 || (_CacheManager$config2 = CacheManager.config) === null || _CacheManager$config2 === void 0 ? void 0 : _CacheManager$config2.sourceAnimationDuration) || 100
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
  const isImageReady = useMemo(() => !!uri, [uri, propsSource]);
  const imageSource = useMemo(() => {
    if (error || !uri) {
      return loadingSource;
    }
    if (isRemoteImage(propsSource) || !isImageWithRequire(propsSource)) {
      return {
        uri: isAndroid() ? `file://${uri}` : uri
      };
    }

    /* If reached here it means it's not http image or local path eg:"/data/user/0/com.reactnativeimagecacheexample/.."
     * so its local image with Require method
     */
    return uri;
  }, [uri, error, propsSource]);
  return /*#__PURE__*/React.createElement(View, {
    style: [styles.container, style],
    testID: testID
  }, !isImageReady && (LoadingImageComponent ? /*#__PURE__*/React.createElement(AnimatedView, {
    style: [styles.loadingImageStyle, loadingImageAnimatedStyle]
  }, /*#__PURE__*/React.createElement(LoadingImageComponent, null)) : /*#__PURE__*/React.createElement(View, {
    style: [styles.loadingImageStyle]
  }, loadingSource && /*#__PURE__*/React.createElement(AnimatedImage, {
    accessibilityHint: accessibilityHintLoadingImage,
    accessibilityLabel: accessibilityLabelLoadingImage,
    accessibilityRole: accessibilityRoleLoadingSource || 'image',
    accessible: true,
    resizeMode: resizeMode || 'contain',
    style: [loadingImageAnimatedStyle, loadingImageStyle],
    source: loadingSource
  }))), thumbnailSource && /*#__PURE__*/React.createElement(AnimatedImage, {
    accessibilityHint: accessibilityHintThumbnail,
    accessibilityLabel: accessibilityLabelThumbnail,
    accessibilityRole: accessibilityRoleThumbnail || 'image',
    accessible: true,
    blurRadius: blurRadius || CacheManager.config.blurRadius,
    onLoad: onThumbnailLoad,
    resizeMode: resizeMode || 'contain',
    source: {
      uri: thumbnailSource,
      ...propsOptions
    },
    style: [style, thumbnailSourceAnimatedStyle]
  }), imageSource && /*#__PURE__*/React.createElement(AnimatedImage, _extends({}, rest, {
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
const styles = StyleSheet.create({
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
export default CachedImage;
//# sourceMappingURL=CachedImage.js.map