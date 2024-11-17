import fs from 'fs';



let stories;
export let storiesWithOutDetail = [];

export function getStoriesWithOutDetail() {
    return storiesWithOutDetail;
}

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
}
