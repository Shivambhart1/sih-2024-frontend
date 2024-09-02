const Button = ({ onClick, text, backgroundColor }) => {
  return (
    <div>
      <button
        onClick={onClick}
        className="border border-black px-4 py-2 rounded bg-black text-white"
      >
        {text}
      </button>
    </div>
  );
};

export default Button;
