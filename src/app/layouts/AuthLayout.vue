<script setup>
/**
 * 认证布局组件
 * 用途: 登录/注册页面的统一布局
 * 位置: app/layouts/ (模板组件层)
 */
</script>

<template>
  <div class="auth-layout">
    <!-- 左侧宣传区 -->
    <div class="hero">
      <div class="hero-content">
        <div class="logo">
          <span class="logo-icon">Js</span>
          <span class="logo-text">cnTest</span>
        </div>
        <h1 class="slogan">
          全场景自动化测试<br />高效交付
        </h1>
        <ul class="features">
          <li><span class="check">✓</span> 永久免费</li>
          <li><span class="check">✓</span> 实时在线</li>
          <li><span class="check">✓</span> 需求管理/测试/持续交付</li>
        </ul>
        <div class="footer-links">
          © 2026 Js.Design Inc. All rights reserved.
          <a href="#">服务条款</a>
          <a href="#">隐私协议</a>
        </div>
      </div>
    </div>

    <!-- 右侧表单区 -->
    <div class="form-wrap">
      <div class="auth-card">
        <slot />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
// 统一紫色渐变背景 - 整个页面一个背景
.auth-layout {
  display: flex;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: linear-gradient(135deg, #a8d8ea 0%, #7ec8e3 25%, #6b9bd1 50%, #8b7ec8 75%, #9b7ec8 100%);
}

/* ========== 左侧宣传区 - 透明背景 ========== */
.hero {
  flex: 0 0 60%;
  display: flex;
  align-items: center;
  padding: 48px 64px;
  box-sizing: border-box;
  background: transparent;
}

.hero-content {
  max-width: 480px;
  color: #fff;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 80px;
}

.logo-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 8px;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.logo-text {
  font-size: 22px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.slogan {
  font-size: 32px;
  line-height: 1.45;
  font-weight: 600;
  margin: 0 0 40px;
  letter-spacing: 0.3px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
}

.features {
  list-style: none;
  margin: 0;
  padding: 0;
  font-size: 16px;
  opacity: 0.95;

  li {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 14px;
  }
}

.check {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  font-size: 12px;
  font-weight: 700;
}

.footer-links {
  margin-top: 120px;
  font-size: 13px;
  opacity: 0.85;

  a {
    color: #fff;
    text-decoration: none;
    margin-left: 12px;

    &:hover {
      text-decoration: underline;
    }
  }
}

/* ========== 右侧表单区 - 透明背景 ========== */
.form-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: transparent;
}

.auth-card {
  width: 100%;
  max-width: 400px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  padding: 40px 36px;
  box-sizing: border-box;
}

/* 响应式 */
@media (max-width: 1024px) {
  .hero {
    flex: 0 0 50%;
    padding: 32px 40px;
  }

  .slogan {
    font-size: 26px;
  }

  .footer-links {
    margin-top: 60px;
  }
}

@media (max-width: 768px) {
  .auth-layout {
    flex-direction: column;
  }

  .hero {
    flex: none;
    min-height: 200px;
    padding: 24px;
  }

  .logo {
    margin-bottom: 24px;
  }

  .slogan {
    font-size: 20px;
    margin-bottom: 16px;
  }

  .features {
    font-size: 14px;
  }

  .footer-links {
    margin-top: 24px;
    font-size: 12px;
  }

  .form-wrap {
    padding: 24px 16px;
  }

  .auth-card {
    padding: 28px 24px;
  }
}
</style>
