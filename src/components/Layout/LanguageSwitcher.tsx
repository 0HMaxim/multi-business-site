import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const languages = ["ru", "en", "de", "uk"];

export default function LanguageSwitcher() {
    const { i18n } = useTranslation();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    const changeLanguage = (newLang: string) => {
        const currentHash = window.location.hash.replace("#", "");
        const parts = currentHash.split("/").filter(Boolean);
        parts[0] = newLang;
        const newPath = "/" + parts.join("/");

        i18n.changeLanguage(newLang);
        navigate(newPath);
        setOpen(false);
    };

    return (
        <div className="relative inline-block duration-500">
            <div
                className="px-4 py-2 cursor-pointer uppercase"
                onClick={() => setOpen(!open)}
            >
                {i18n.language}
            </div>

            <div
                className={`
              absolute left-0 mt-0 flex flex-col
              transition-all duration-500 ease-in-out
              ${open ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-1 pointer-events-none"}
            `}
            >
                {languages
                    .filter((lang) => lang !== i18n.language)
                    .map((language, index) => (
                        <div
                            key={language}
                            onClick={() => changeLanguage(language)}
                            className="px-4 py-1 cursor-pointer uppercase hover:underline transition-all duration-500 ease-in-out"
                            style={{ transitionDelay: `${index * 100}ms` }}
                        >
                            {language}
                        </div>
                    ))}
            </div>
        </div>
    );
}