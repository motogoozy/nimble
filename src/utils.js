export const formatColor = arr => `rgba(${arr[0]}, ${arr[1]}, ${arr[2]}, ${arr[3]})`;

export const getUserInitials = user => {
  const first = user.first_name.split('')[0];
  const last = user.last_name.split('')[0];

  return first + last;
};
