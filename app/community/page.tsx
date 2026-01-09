"use client"

import Community from "@/app/components/Community";
import VideoLoader from "@/app/components/VideoLoader";

export default function Page() {
    return (
        <>
            <VideoLoader text="Titan Atmosphere" />
            <Community />
        </>
    );
}
