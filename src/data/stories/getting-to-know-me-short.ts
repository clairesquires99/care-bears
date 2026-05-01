export type BookSeg =
  | { t: 'tx'; v: string }
  | { t: 'it'; v: string }
  | { t: 'br' }
  | { t: 'bl'; key: string; ph: string; multi?: boolean; italic?: boolean }

export type BookPage = { segs?: BookSeg[] }
export type BookSpread = { L: BookPage; R: BookPage }

export const STORY: BookSpread[] = [
  // Screen 1
  {
    L: {
      segs: [
        { t: 'it', v: '"Ring around the rosie, a pocket full of posies, ashes, ashes, we all fall down."' },
        { t: 'it', v: "We'll get to the ashes part. First — let's talk about life." },
        { t: 'br' },
        { t: 'tx', v: "So… you want to know if I want to be buried, cremated, or sent off viking style? There's a whole side of me you'll get to know before that." },
      ],
    },
    R: {
      segs: [
        { t: 'tx', v: 'Now, the important stuff. My dream superpower would be:' },
        { t: 'bl', key: 'superpower', ph: 'flying, reading minds…' },
        { t: 'tx', v: '. I\'d use it to:' },
        { t: 'bl', key: 'superpower_use', ph: 'protect the ones I love…' },
        { t: 'tx', v: '.' },
      ],
    },
  },

  // Screen 2
  {
    L: {
      segs: [
        { t: 'tx', v: 'You know me as' },
        { t: 'bl', key: 'relationship', ph: 'grandma, dad…' },
        { t: 'tx', v: ', but there are whole versions of me that existed before that. One memory from childhood that still feels especially funny, vivid, or telling is:' },
        { t: 'bl', key: 'childhood_memory', ph: 'the time I…', multi: true },
        { t: 'tx', v: '.' },
      ],
    },
    R: {
      segs: [
        { t: 'tx', v: 'Did you know I had this nickname:' },
        { t: 'bl', key: 'nickname', ph: 'Biscuit, Tiger…' },
        { t: 'tx', v: '? I got it because:' },
        { t: 'bl', key: 'nickname_reason', ph: "well, it's a funny story…", multi: true },
        { t: 'tx', v: '.' },
      ],
    },
  },

  // Screen 3
  {
    L: {
      segs: [
        { t: 'tx', v: "Let's be real for a sec. One thing I still hope you'll ask me, or remember long after the practical stuff fades:" },
        { t: 'bl', key: 'remember_this', ph: 'that I loved mornings…', multi: true },
        { t: 'tx', v: '.' },
      ],
    },
    R: {
      segs: [
        { t: 'tx', v: 'Okay but seriously…' },
        { t: 'bl', key: 'final_wishes', ph: 'Cremate me / Bury me / Shoot me to the moon' },
        { t: 'tx', v: '.' },
        { t: 'br' },
        { t: 'it', v: 'P.S. Superhero name:' },
        { t: 'bl', key: 'superhero_name', ph: 'The Magnificent One', italic: true },
        { t: 'it', v: '.' },
      ],
    },
  },
];
