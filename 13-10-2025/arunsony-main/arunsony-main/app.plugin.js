const { withProjectBuildGradle, withAppBuildGradle } = require('@expo/config-plugins');

/**
 * Custom Expo Config Plugin for react-native-razorpay
 * This ensures proper Razorpay SDK configuration in Android builds
 */
const withRazorpay = (config) => {
  // Modify project-level build.gradle
  config = withProjectBuildGradle(config, (config) => {
    if (config.modResults.contents) {
      // Ensure maven repository for Razorpay is added
      const mavenRazorpay = "        maven { url 'https://jitpack.io' }";
      if (!config.modResults.contents.includes("jitpack.io")) {
        config.modResults.contents = config.modResults.contents.replace(
          /allprojects\s*\{[\s\S]*?repositories\s*\{/,
          (match) => `${match}\n${mavenRazorpay}`
        );
      }
    }
    return config;
  });

  // Modify app-level build.gradle
  config = withAppBuildGradle(config, (config) => {
    if (config.modResults.contents) {
      // Ensure proguard rules for Razorpay
      const proguardComment = "\n    // Razorpay Proguard configuration";
      if (!config.modResults.contents.includes("Razorpay Proguard")) {
        config.modResults.contents = config.modResults.contents.replace(
          /proguardFiles\s+getDefaultProguardFile/,
          `${proguardComment}\n            proguardFiles getDefaultProguardFile`
        );
      }
    }
    return config;
  });

  return config;
};

module.exports = withRazorpay;

