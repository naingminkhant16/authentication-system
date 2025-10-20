import type {Metadata} from "next";
import "./globals.css";


export const metadata: Metadata = {
    title: "Employee Authentication System",
    description: "Employee Authentication System",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
        <body
        >
        {children}
        </body>
        </html>
    );
}
