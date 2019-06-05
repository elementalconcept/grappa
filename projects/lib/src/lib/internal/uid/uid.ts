const uidKey = '__GRAPPA_UID';
let generator = 0;

export function UID(o: Object) {
  if (o[ uidKey ] === undefined) {
    Object.defineProperty(o, uidKey, {
      value: ++generator,
      enumerable: false,
      writable: false
    });
  }

  return o[ uidKey ];
}
