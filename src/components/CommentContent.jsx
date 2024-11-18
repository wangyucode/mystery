import { StarIcon as StarIconOutline } from "@heroicons/react/24/outline"
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid"
import { Rating } from '@smastrom/react-rating'
import '@smastrom/react-rating/style.css'
import { Button } from "@nextui-org/react"
import { useState } from "react"

import socket from "../socket"

export default function CommentContent({ submitted, roomId }) {

    const [rating, setRating] = useState(5);
    const [showSubmit, setShowSubmit] = useState(!submitted);

    const handleSubmit = () => {
        socket.emit("rating", { roomId, rating });
        setShowSubmit(false);
    }

    return (
        <div className="flex flex-col gap-2">
            <div className="flex flex-row items-center gap-2">
                <p>剧本评价：</p>
                <Rating value={rating} onChange={setRating} readOnly={!showSubmit} className="max-w-32" />
                {showSubmit && <Button size="sm" color="primary" variant="bordered" onClick={handleSubmit}>提交</Button>}
            </div>
            {!showSubmit && <p>你现在可与其他人继续讨论。或退出房间。</p>}
        </div>
    )
}