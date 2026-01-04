export function Footer() {
  return (
    <div className="mt-12 flex justify-center">
      <div className='group inline m-3 cursor-pointer'>
        <a
          href="https://ersatztv.org"
          target="_blank"
          rel="noopener noreferrer"
          className='inline-block cursor-pointer text-center text-sm text-gray-300 bg-neutral-800 px-3 py-1.5 rounded-full transition-transform duration-300 ease-in-out group-hover:-translate-y-2 group-hover:drop-shadow-xl drop-shadow-black'
        >
          Built for <span className='text-primary'>ErsatzTV</span>
        </a>
      </div>
    </div>
  );
}
