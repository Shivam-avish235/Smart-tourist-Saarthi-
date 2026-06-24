let io = {
  emit: (...args) => {
    console.log("Socket event skipped on Vercel:", ...args);
  }
};

export function initSocket() {
  console.log("Socket.IO disabled for Vercel deployment");
  return io;
}

export function getIO() {
  return io;
}