import fs from 'fs';

import { db } from "./db.js";

let stories;
export let storiesWithOutDetail = [];

export function getStory(title) {
    return stories.find(story => story.title === title);
}

// read all the json file as stories under doc
export function readStroies() {
    const files = fs.readdirSync('server/doc');
    stories = files.filter(file => file.endsWith('.json')).map(file => {
        const story = JSON.parse(fs.readFileSync(`server/doc/${file}`, 'utf8'))
        storiesWithOutDetail.push({
            title: story.title,
            people: story.people,
        });
        return story;
    });
    initStoriesRating();
}

export async function initStoriesRating() {
    for (let story of storiesWithOutDetail) {
        let rating;
        try {
            rating = await db.get(story.title);
        } catch (e) {
            console.error("init rating", story.title, e);
        }
        if (!rating) {
            await db.put(story.title, { rating: 500, user: 100, tokens: 0, count: 0 });
            story.rating = 5;
        } else {
            story.rating = rating.rating / rating.user;
            console.log("init rating", story.title, rating);
        }
    }
    storiesWithOutDetail.sort((a, b) => b.rating - a.rating);
}
