import { 
  signUp, 
  signIn, 
  signOut, 
  onAuthChange, 
  getCurrentUser,
  requestPasswordReset,
  updatePassword,
  getPasswordResetToken,
  verifyPasswordResetToken
} from "./auth.js";
import { carregarTurmasPainel, initTurmasUI, initVoltarTurmas } from "./ui.js";
import { getProfessorAtual } from "./api.js";

function setAppView(loggedIn) {
  const authView = document.getElementById("auth-view");
  const appView = document.getElementById("app-view");
  if (loggedIn) {
    authView.classList.add("hidden");
    appView.classList.remove("hidden");
  } else {
    authView.classList.remove("hidden");
    appView.classList.add("hidden");
  }
}

function showAuthView() {
  document.getElementById("auth-view").classList.remove("hidden");
  document.getElementById("forgot-password-view").classList.add("hidden");
  document.getElementById("reset-password-view").classList.add("hidden");
}

function showForgotPasswordView() {
  document.getElementById("auth-view").classList.add("hidden");
  document.getElementById("forgot-password-view").classList.remove("hidden");
  document.getElementById("reset-password-view").classList.add("hidden");
}

function showResetPasswordView() {
  document.getElementById("auth-view").classList.add("hidden");
  document.getElementById("forgot-password-view").classList.add("hidden");
  document.getElementById("reset-password-view").classList.remove("hidden");
}

let appInitialized = false;
async function initAfterLogin() {
  if (appInitialized) return;
  appInitialized = true;

  initTurmasUI();
  initVoltarTurmas();
  await carregarTurmasPainel();
}

/* --------- Auth UI (com recuperação de senha) --------- */
function initAuthUI() {
  const loginTab = document.getElementById("loginTabBtn");
  const signupTab = document.getElementById("signupTabBtn");
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");
  const authMsg = document.getElementById("authMessage");
  const forgotPasswordLink = document.getElementById("forgotPasswordLink");
  const backToLoginLink = document.getElementById("backToLoginLink");

  function showLogin() {
    loginTab.classList.add("active");
    signupTab.classList.remove("active");
    loginForm.classList.remove("hidden");
    signupForm.classList.add("hidden");
    authMsg.textContent = "";
    showAuthView();
  }

  function showSignup() {
    signupTab.classList.add("active");
    loginTab.classList.remove("active");
    signupForm.classList.remove("hidden");
    loginForm.classList.add("hidden");
    authMsg.textContent = "";
    showAuthView();
  }

  loginTab.addEventListener("click", showLogin);
  signupTab.addEventListener("click", showSignup);

  // Link "Esqueci minha senha"
  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener("click", (e) => {
      e.preventDefault();
      showForgotPasswordView();
    });
  }

  // Link "Voltar para login"
  if (backToLoginLink) {
    backToLoginLink.addEventListener("click", (e) => {
      e.preventDefault();
      showLogin();
    });
  }

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    authMsg.textContent = "";
    try {
      const email = document.getElementById("loginEmail").value;
      const password = document.getElementById("loginPassword").value;
      await signIn({ email, password });
      authMsg.style.color = "#4caf50";
      authMsg.textContent = "Login realizado.";
    } catch (err) {
      authMsg.style.color = "#e53935";
      authMsg.textContent = err.message || "Erro ao fazer login.";
    }
  });

  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    authMsg.textContent = "";
    try {
      const nome = document.getElementById("signupNome").value;
      const email = document.getElementById("signupEmail").value;
      const password = document.getElementById("signupPassword").value;
      await signUp({ nome, email, password });
      authMsg.style.color = "#4caf50";
      authMsg.textContent =
        "Cadastro realizado. Verifique seu email (se a confirmação estiver ativada).";
      showLogin();
    } catch (err) {
      authMsg.style.color = "#e53935";
      authMsg.textContent = err.message || "Erro ao cadastrar.";
    }
  });
}

/* --------- Password Recovery UI --------- */
function initPasswordRecoveryUI() {
  const forgotPasswordForm = document.getElementById("forgotPasswordForm");
  const resetPasswordForm = document.getElementById("resetPasswordForm");
  const forgotPasswordMsg = document.getElementById("forgotPasswordMessage");
  const resetPasswordMsg = document.getElementById("resetPasswordMessage");

  // Formulário de solicitação de recuperação
  if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      forgotPasswordMsg.textContent = "";
      forgotPasswordMsg.style.color = "#e53935";

      try {
        const email = document.getElementById("forgotPasswordEmail").value;
        if (!email) {
          throw new Error("Por favor, informe seu e-mail.");
        }

        await requestPasswordReset(email);
        forgotPasswordMsg.style.color = "#22c55e";
        forgotPasswordMsg.textContent =
          "Link de recuperação enviado! Verifique seu e-mail.";
        forgotPasswordForm.reset();

        // Limpar mensagem após 5 segundos
        setTimeout(() => {
          if (forgotPasswordMsg.textContent.includes("enviado")) {
            forgotPasswordMsg.textContent = "";
          }
        }, 5000);
      } catch (err) {
        forgotPasswordMsg.style.color = "#e53935";
        forgotPasswordMsg.textContent =
          err.message || "Erro ao solicitar recuperação de senha.";
      }
    });
  }

  // Formulário de redefinição de senha
  if (resetPasswordForm) {
    resetPasswordForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      resetPasswordMsg.textContent = "";
      resetPasswordMsg.style.color = "#e53935";

      try {
        const newPassword = document.getElementById("resetPasswordNew").value;
        const confirmPassword = document.getElementById("resetPasswordConfirm").value;

        if (!newPassword || !confirmPassword) {
          throw new Error("Por favor, preencha todos os campos.");
        }

        if (newPassword !== confirmPassword) {
          throw new Error("As senhas não correspondem.");
        }

        if (newPassword.length < 6) {
          throw new Error("A senha deve ter no mínimo 6 caracteres.");
        }

        await updatePassword(newPassword);
        resetPasswordMsg.style.color = "#22c55e";
        resetPasswordMsg.textContent =
          "Senha redefinida com sucesso! Redirecionando para login...";
        resetPasswordForm.reset();

        // Redirecionar para login após 2 segundos
        setTimeout(() => {
          window.location.hash = "";
          window.location.reload();
        }, 2000);
      } catch (err) {
        resetPasswordMsg.style.color = "#e53935";
        resetPasswordMsg.textContent =
          err.message || "Erro ao redefinir senha.";
      }
    });
  }
}

/* --------- Eventos gerais do app --------- */
function initAppEvents() {
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await signOut();
      appInitialized = false;
    });
  }
}

/* --------- Inicialização --------- */
document.addEventListener("DOMContentLoaded", async () => {
  initAuthUI();
  initPasswordRecoveryUI();
  initAppEvents();

  // Verificar se há token de redefinição de senha na URL
  const resetToken = getPasswordResetToken();
  if (resetToken) {
    const user = await verifyPasswordResetToken(resetToken);
    if (user) {
      showResetPasswordView();
    } else {
      alert("Token de redefinição inválido ou expirado. Tente novamente.");
      window.location.hash = "";
    }
  }

  // Observer de auth
  onAuthChange(async (user) => {
    setAppView(!!user);
    if (user) {
      const prof = await getProfessorAtual().catch(() => null);
      const nameEl = document.getElementById("currentTeacherName");
      if (prof && nameEl) {
        nameEl.textContent = prof.nome || user.email;
      }
      await initAfterLogin();
    } else {
      appInitialized = false;
    }
  });

  // Se já estiver logado (refresh)
  const existingUser = await getCurrentUser();
  if (existingUser && !resetToken) {
    setAppView(true);
    const prof = await getProfessorAtual().catch(() => null);
    const nameEl = document.getElementById("currentTeacherName");
    if (prof && nameEl) {
      nameEl.textContent = prof.nome || existingUser.email;
    }
    await initAfterLogin();
  } else if (!resetToken) {
    setAppView(false);
  }
});