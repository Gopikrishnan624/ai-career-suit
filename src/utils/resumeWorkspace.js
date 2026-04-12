const RESUME_WORKSPACE_KEY = 'resumeWorkspace';

export function loadResumeWorkspace() {
  const raw = localStorage.getItem(RESUME_WORKSPACE_KEY);
  if (!raw) {
    return { resumeText: '', analysis: null };
  }

  try {
    const parsed = JSON.parse(raw);
    return {
      resumeText: parsed.resumeText || '',
      analysis: parsed.analysis || null,
    };
  } catch {
    localStorage.removeItem(RESUME_WORKSPACE_KEY);
    return { resumeText: '', analysis: null };
  }
}

export function saveResumeWorkspace(data) {
  const nextValue = {
    resumeText: data?.resumeText || '',
    analysis: data?.analysis || null,
  };

  localStorage.setItem(RESUME_WORKSPACE_KEY, JSON.stringify(nextValue));
  return nextValue;
}

export function clearResumeWorkspace() {
  localStorage.removeItem(RESUME_WORKSPACE_KEY);
}
