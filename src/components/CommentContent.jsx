import { useState } from "react"
import { Rating } from '@smastrom/react-rating'
import { Button } from "@nextui-org/react"

import socket from "../socket"

export default function CommentContent({ submitted, roomId }) {

    const [rating, setRating] = useState(5);
    const [submittedRating, setSubmittedRating] = useState(submitted);

    const handleSubmit = () => {
        socket.emit("rating", { roomId, rating });
        setSubmittedRating(rating);
    }

    return (
        <div className="flex flex-col gap-2">
            <div className="flex flex-row items-center gap-2">
                <p>剧本评价：</p>
                <Rating value={rating} onChange={setRating} readOnly={submittedRating} className="max-w-32" />
                {!submittedRating && <Button size="sm" color="primary" variant="bordered" onClick={handleSubmit}>提交</Button>}
            </div>
            {submittedRating && <p>你现在可与其他人继续讨论。或退出房间。</p>}
        </div>
    )
}