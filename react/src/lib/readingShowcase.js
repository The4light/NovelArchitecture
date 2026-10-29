// Switch off to remove all fictional books, sample ratings and sample reviews.
export const SHOW_DEMO_BOOKS = true;
const titles = [
  [
    "The Glass Orchard",
    "Fantasy",
    "Novel",
    "A gardener discovers that every fruit holds a memory someone wanted forgotten.",
  ],
  [
    "Letters from the Moon",
    "Sci-Fi",
    "Novella",
    "The last lunar postmaster receives a letter addressed to a city that no longer exists.",
  ],
  [
    "A Summer in Blue",
    "Romance",
    "Novel",
    "Two strangers inherit the same seaside bookshop, and very different plans for its future.",
  ],
  [
    "The Midnight Society",
    "Mystery",
    "Serial",
    "An invitation arrives every midnight. This time, the recipient has been dead for years.",
  ],
  [
    "Where the Wild Stars Go",
    "Fantasy",
    "Novel",
    "A fallen constellation asks a village mapmaker for the way home.",
  ],
  [
    "The Last Lightkeeper",
    "Adventure",
    "Novella",
    "Beyond the last lighthouse, an ocean of clouds hides an impossible island.",
  ],
  [
    "Paper Hearts",
    "Romance",
    "Short story",
    "A misdelivered notebook connects two neighbours who have never met.",
  ],
  [
    "The Quiet Between Worlds",
    "Sci-Fi",
    "Novel",
    "A sound engineer hears another universe in the silence between radio stations.",
  ],
  [
    "Beneath the Copper Sky",
    "Adventure",
    "Serial",
    "A runaway mechanic joins an airship crew searching for a stolen sunrise.",
  ],
  [
    "The House of Small Hours",
    "Mystery",
    "Novel",
    "Every room in an inherited house remembers a different version of yesterday.",
  ],
  [
    "Saltwater & Starlight",
    "Romance",
    "Novella",
    "An astronomer returns to the coast to mend an old telescope and a much older promise.",
  ],
  [
    "A Kingdom of Moths",
    "Fantasy",
    "Serial",
    "The youngest royal archivist discovers the kingdom’s history has wings.",
  ],
  [
    "After the Rain",
    "Literary",
    "Short story",
    "One afternoon, five neighbours finally open the doors they have kept closed.",
  ],
  [
    "The Memory Atlas",
    "Sci-Fi",
    "Novel",
    "A cartographer maps lost memories before a city trades its past for tomorrow.",
  ],
  [
    "Seven Doors to Autumn",
    "Fantasy",
    "Novella",
    "A locksmith finds seven keys, each opening onto a different autumn.",
  ],
  [
    "The Violet Passenger",
    "Mystery",
    "Short story",
    "On an overnight train, a passenger leaves behind a ticket dated fifty years ahead.",
  ],
  [
    "Islands of the Unseen",
    "Adventure",
    "Novel",
    "An apprentice navigator follows a map that only appears in moonlight.",
  ],
  [
    "The Bookshop at Dawn",
    "Literary",
    "Novel",
    "A bookseller starts leaving a different book on the same park bench every morning.",
  ],
  [
    "Orbit of Us",
    "Romance",
    "Serial",
    "Two rival pilots share a quiet radio frequency on the long journey home.",
  ],
  [
    "Winter in the Emberwood",
    "Fantasy",
    "Novel",
    "A forest that has never known winter wakes under its first snowfall.",
  ],
  [
    "The Blue Hour Express",
    "Mystery",
    "Novella",
    "A train arrives at an abandoned platform carrying the missing pieces of a small town.",
  ],
  [
    "Gardens of Tomorrow",
    "Sci-Fi",
    "Short story",
    "On a drifting space station, the last botanist plants something that cannot be named.",
  ],
  [
    "The Mapmaker’s Daughter",
    "Adventure",
    "Novel",
    "A daughter follows the unfinished roads on her father’s final map.",
  ],
  [
    "All the Soft Goodbyes",
    "Literary",
    "Novella",
    "Three sisters gather to pack a family home and discover what they want to keep.",
  ],
];
const palettes = [
  "#193c53",
  "#444a78",
  "#397c86",
  "#582e55",
  "#4d6552",
  "#966343",
  "#9d5e70",
  "#25495e",
];
export const demoBooks = titles.map(
  ([title, genre, book_type, synopsis], i) => ({
    id: `demo-reading-${i + 1}`,
    title,
    genre,
    book_type,
    synopsis,
    author_name: [
      "Elena Vale",
      "N. K. Rivers",
      "Amara Ellis",
      "Theo Wren",
      "June Bell",
      "Ira Sol",
    ][i % 6],
    isDemo: true,
    jacket: palettes[i % palettes.length],
    rating_average: Number((4.2 + (i % 8) * 0.1).toFixed(1)),
    review_count: 24 + i * 17,
  }),
);
// Never invent public review statistics or formats for live books.
export function reviewStats(book) {
  const average = Number(book.rating_average),
    count = Number(book.review_count);
  return count > 0 && average >= 1 && average <= 5 ? { average, count } : null;
}
export function readingType(book) {
  return book.book_type || "Unspecified";
}
