/**
 * Ko-fi donation button component
 * Simple link-based implementation
 */
export function KofiButton() {
  return (
    <a
      href='https://ko-fi.com/jorcob'
      target='_blank'
      rel="noopener noreferrer"
      className="rounded-l-full rounded-r-full overflow-hidden inline-flex items-center transition-transform duration-300 ease-in-out group-hover:-translate-y-2 group-hover:drop-shadow-xl drop-shadow-black"
    >
      <img
        height='32'
        style={{border: 0, height: '32px', display: 'block'}}
        src='https://storage.ko-fi.com/cdn/kofi3.png?v=6'
        alt='Buy Me a Coffee at ko-fi.com'
      />
    </a>
  );
}
