if (!sessionStorage.getItem('knl_auth')) location.href = '../index.html';

document.getElementById('ackLink').onclick = function(e) {
  e.preventDefault();
  var s = encodeURIComponent('Policy Acknowledgment - KNEURALABS');
  var b = encodeURIComponent('I have read and understood the KNEURALABS policy handbook and agree to comply.\n\nName: [Your name]\nRole: [Your role]\nDate: ' + new Date().toLocaleDateString());
  location.href = 'mailto:hello@kneuralabs.com?subject=' + s + '&body=' + b;
};

// ── Back-to-top ──────────────────────────────────────────────────────
var backToTop   = document.getElementById('backToTop');
var mainContent = document.getElementById('mainContent');

backToTop.onclick = function() {
  mainContent.scrollTo({ top: 0, behavior: 'smooth' });
};

mainContent.addEventListener('scroll', function() {
  if (mainContent.scrollTop > 100) {
    backToTop.classList.add('visible');
  } else {
    backToTop.classList.remove('visible');
  }
}, { passive: true });

// ── Mobile menu toggle ───────────────────────────────────────────────
var toggle  = document.getElementById('mobileMenuToggle');
var sidebar = document.getElementById('sidebar');
toggle.onclick = function() { sidebar.classList.toggle('mobile-open'); };

// ── Search ───────────────────────────────────────────────────────────
var searchInput = document.getElementById('sidebarSearch');
document.getElementById('searchBtn').onclick = doSearch;
searchInput.addEventListener('keypress', function(e) { if (e.key === 'Enter') doSearch(); });
document.getElementById('clearSearch').onclick = function() { searchInput.value = ''; };

function doSearch() {
  var q = searchInput.value.trim().toLowerCase();
  if (!q) return;
  var pages = [
    { file: 'hr.html',         terms: ['hr', 'people', 'hiring', 'hire', 'onboard', 'employee', 'contractor', 'training', 'background check', 'offboard', 'exit interview'] },
    { file: 'finance.html',    terms: ['finance', 'expense', 'invoice', 'travel', 'fraud', 'budget', 'purchase', 'reimburs', 'payment', 'spending', 'receipts'] },
    { file: 'it.html',         terms: ['it security', 'password', 'mfa', 'multi-factor', 'phishing', 'shadow ai', 'encrypt', 'ransomware', 'cyber', 'information security', 'security incident', 'malware', 'vpn'] },
    { file: 'legal.html',      terms: ['legal', 'ai act', 'nist', 'copyright', 'ctdpa', 'compliance', 'contract', 'intellectual property', 'ai rules', 'regulation', 'liability'] },
    { file: 'conduct.html',    terms: ['conduct', 'ethics', 'integrity', 'brib', 'corruption', 'fcpa', 'misconduct', 'equal opportunity', 'discrimination', 'gifts', 'anti-bribery', 'honesty'] },
    { file: 'safety.html',     terms: ['harassment', 'violence', 'bully', 'drug', 'alcohol', 'mental health', 'wellbeing', 'retaliation', 'safe workplace', 'safety'] },
    { file: 'workplace.html',  terms: ['workplace', 'remote work', 'badge', 'physical security', 'clear desk', 'record retention', 'legal hold', 'tailgat', 'visitor', 'usb', 'acceptable use'] },
    { file: 'privacy.html',    terms: ['privacy', 'personal data', 'data breach', 'data protection', 'gdpr', 'right to access', 'right to deletion', 'data subject', 'dpa', 'data processing'] },
    { file: 'acknowledge.html',terms: ['acknowledge', 'acknowledgment', 'confirm', 'sign off', 'complete'] },
    { file: 'overview.html',   terms: ['overview', 'handbook', 'whistleblow', 'golden rule', 'policy', 'about'] },
  ];
  for (var i = 0; i < pages.length; i++) {
    var terms = pages[i].terms;
    for (var j = 0; j < terms.length; j++) {
      var term = terms[j];
      if (q === term || q.indexOf(term) !== -1 || term.startsWith(q)) {
        location.href = pages[i].file;
        return;
      }
    }
  }
  location.href = 'overview.html';
}

// ── Nav item staggered entrance ──────────────────────────────────────
document.querySelectorAll('.nav-item').forEach(function(el, i) {
  el.style.animationDelay = (0.16 + i * 0.045) + 's';
});

// ── Scroll-reveal for policy content ─────────────────────────────────
var revealItems = document.querySelectorAll('.policy-section-block > *');
if (revealItems.length) {
  revealItems.forEach(function(el) { el.classList.add('reveal-item'); });

  var observer = new IntersectionObserver(function(entries) {
    // Sort visible entries top-to-bottom for a natural stagger
    var visible = entries.filter(function(e) { return e.isIntersecting; });
    visible.sort(function(a, b) { return a.boundingClientRect.top - b.boundingClientRect.top; });

    visible.forEach(function(entry, i) {
      var el = entry.target;
      el.style.transitionDelay = (i * 0.07) + 's';
      // rAF ensures the class change triggers a transition
      requestAnimationFrame(function() {
        el.classList.add('revealed');
        // Remove delay so subsequent scroll-ins are instant
        setTimeout(function() { el.style.transitionDelay = ''; }, 700);
      });
      observer.unobserve(el);
    });
  }, {
    root: mainContent,
    threshold: 0.05,
    rootMargin: '0px 0px -10px 0px'
  });

  revealItems.forEach(function(el) { observer.observe(el); });
}
