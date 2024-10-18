import axios from "axios";
import type React from "react";
import { useEffect, useState } from "react";

interface Link {
  name: string;
  site: string;
  siteURL: string;
  icon: string;
}

const cardHoverStyle: React.CSSProperties = {
  position: "relative",
  transform: "translateY(0)",
  transition: "all 0.3s ease",
};

const LinksComponent: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [links, setLinks] = useState<Link[]>([]);

  useEffect(() => {
    const loadData = async (): Promise<void> => {
      try {
        const json_file = "/assets/myLinks.json";
        const response = await axios.get<Link[]>(json_file);
        setLinks(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading data:", error);
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div>
      <p className="text-xs text-right">
        📧:
        <a className="link" href="mailto:chzang55@gmail.com">
          chzang55@gmail.com
        </a>
      </p>
      <br />
      {isLoading
        ? <p className="text-center">列表載入中，請稍等載入……</p>
        : (
          <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2 mb-3">
            {links.map((card, index) => (
              <div
                key={index}
                style={cardHoverStyle}
                onMouseOver={(
                  e,
                ) => (e.currentTarget.style.transform = "translateY(-5px)")}
                onMouseOut={(
                  e,
                ) => (e.currentTarget.style.transform = "translateY(0)")}
              >
                <a href={card.siteURL}>
                  <div className="relative overflow-hidden border-b-2 border-r-2 border-main avatar_img">
                    <img
                      className="absolute h-full"
                      src={card.icon || "../assets/images/default.jpg"}
                      id={`avatar${index}`}
                      alt={`avatar${card.name}`}
                    />
                    <div className="min-w-0 py-5 pl-28 pr-5">
                      <div className="text-slate-900 font-medium text-sm sm:text-base truncate dark:text-slate-200">
                        {card.name}
                      </div>
                      <div className="text-slate-500 font-medium text-sm sm:text-base leading-tight truncate dark:text-slate-400">
                        {card.site}
                      </div>
                    </div>
                  </div>
                </a>
              </div>
            ))}
          </div>
        )}
    </div>
  );
};

export default LinksComponent;
