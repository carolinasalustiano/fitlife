import { Post, RankingUser } from './types';

export const IMAGES = {
  currentUser: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png", // Pikachu
  sarah: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/133.png", // Eevee
  workout1: "https://lh3.googleusercontent.com/aida-public/AB6AXuCeobtcmtzAERXuBW6uvTQQhrbZ62IeuK51zT0dB36romFnQxI6Iu_5-Hrr1XbhUxbPRx6hdmn5mPPHutpmZmKXleW3Nf57H8ylS0eBGX6MvEQU3JUiPfx26dWiBNRAmyiMvdeU70ikWgy2Lv0_QiVlUEHGkgFOdeMNU0Zs42AQXTNS0W2BbcjGT3L9KCbCjw74XIaax7OuSQdiSzNTbnVXMcaF72AOvgJkj3cFm0InVn11HQ-5frxjJSN3rJgSzOd5Y_6CQXCFN7I",
  marcus: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png", // Charizard
  david: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png", // Squirtle
  elena: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png", // Bulbasaur
  chloe: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png", // Mewtwo
  james: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/94.png", // Gengar
  sophie: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png" // Charmander
};

export const FEED_DATA: Post[] = [
  {
    id: '1',
    user: { id: 's1', name: 'Sarah Jenkins', avatar: IMAGES.sarah },
    timeAgo: 'Há 2 horas',
    location: 'Venice Beach',
    type: 'SESSÃO HIIT',
    title: 'Queima Matinal 🔥',
    image: IMAGES.workout1,
    stats: [
      { label: 'Duração', value: '45', unit: 'min' },
      { label: 'Calorias', value: '380' },
    ],
    likes: 124,
    isLiked: false,
    comments: [
      { id: 'c1', user: { id: 'u3', name: 'Mike T.', avatar: IMAGES.james }, text: 'Boa! Mandou ver 💪', createdAt: '1h' }
    ],
  }
];

export const RANKING_DATA: RankingUser[] = [
  // EASY LEAGUE
  { id: '4', name: 'David K.', avatar: IMAGES.david, points: 1450, rank: 1, stats: '12 treinos', photos: 4, leagueLevel: 'Fácil' },
  { id: '5', name: 'Você', avatar: IMAGES.currentUser, points: 1385, rank: 2, stats: '9 treinos', photos: 2, isCurrentUser: true, leagueLevel: 'Fácil' },
  { id: '6', name: 'Chloe M.', avatar: IMAGES.chloe, points: 1210, rank: 3, stats: '8 treinos', photos: 5, leagueLevel: 'Fácil' },
  { id: '8', name: 'Sophie B.', avatar: IMAGES.sophie, points: 980, rank: 4, stats: '7 treinos', photos: 2, leagueLevel: 'Fácil' },
  { id: '9', name: 'Mike T.', avatar: IMAGES.james, points: 400, rank: 5, stats: '3 treinos', photos: 0, leagueLevel: 'Fácil' },

  // INTERMEDIATE LEAGUE
  { id: '2', name: 'Sarah J.', avatar: IMAGES.sarah, points: 1840, rank: 1, stats: '18 treinos', photos: 12, leagueLevel: 'Intermediário' },
  { id: '3', name: 'Elena R.', avatar: IMAGES.elena, points: 1620, rank: 2, stats: '15 treinos', photos: 5, leagueLevel: 'Intermediário' },
  { id: '7', name: 'James L.', avatar: IMAGES.james, points: 1195, rank: 3, stats: '10 treinos', photos: 1, leagueLevel: 'Intermediário' },

  // ADVANCED LEAGUE
  { id: '1', name: 'Marcus V.', avatar: IMAGES.marcus, points: 2150, rank: 1, stats: '20 treinos', photos: 8, leagueLevel: 'Avançado' },
];