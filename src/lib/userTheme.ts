export const ROHIT_USERS = [
  'pardhupavan456@gmail.com',
  'navadhanushka474@gmail.com',
  'navadhanuskha474@gmail.com',
  'navadhanushka@gmail.com',
  'navadhanuskha@gmail.com',
];

export const isRohitUser = (email?: string | null): boolean => {
  if (!email) return false;
  const userEmail = email.trim().toLowerCase();

  // STRICT GUARANTEE FOR NAVYA SRI:
  // Any user with navya, navyasri, or kovelakuntla must NEVER receive Rohit Sharma or Hitman themes/assets
  if (
    userEmail.includes('navya') ||
    userEmail.includes('navyasri') ||
    userEmail.includes('kovela') ||
    userEmail.includes('kovelakuntla')
  ) {
    return false;
  }

  if (ROHIT_USERS.includes(userEmail)) return true;
  if (
    userEmail.includes('navadhanushka') ||
    userEmail.includes('navadhanuskha') ||
    userEmail.includes('pardhupavan')
  ) {
    return true;
  }
  return false;
};

// Navya Sri gets the adorable pastel pink stationery scrapbook art theme
export const isNavyaUser = (email?: string | null): boolean => {
  return !isRohitUser(email);
};

export const isStationeryUser = (email?: string | null): boolean => {
  return !isRohitUser(email);
};

// isSpecialUser returns true if user gets dedicated themed UI (Stationery or Rohit)
export const isSpecialUser = (email?: string | null): boolean => {
  return true;
};

// Astronaut celebration modal upon task completion
export const isSpecialAstronautUser = (email?: string | null): boolean => {
  if (!email) return false;
  const userEmail = email.trim().toLowerCase();
  return (
    isRohitUser(userEmail) ||
    userEmail.includes('navyakovelakuntla')
  );
};





