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
      } catch {
        // 可以根據需求處理錯誤，例如顯示提示訊息
        //console.error("Data loading failed.");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div>
      <p className="text-right text-xs">
        📧:
        <a className="link" href="mailto:chzang55@gmail.com">
          chzang55@gmail.com
        </a>
      </p>
      <br />
      {isLoading ? (
        <p className="text-center">列表載入中，請稍等載入……</p>
      ) : (
        <div className="mb-3 grid grid-cols-1 gap-3.5 md:grid-cols-2">
          {links.map((card, index) => (
            <div
              key={index}
              style={cardHoverStyle}
              onMouseOver={e =>
                (e.currentTarget.style.transform = "translateY(-5px)")
              }
              onMouseOut={e =>
                (e.currentTarget.style.transform = "translateY(0)")
              }
            >
              <a href={card.siteURL}>
                <div className="border-main avatar_img relative overflow-hidden border-r-2 border-b-2">
                  <img
                    className="absolute h-full"
                    src={card.icon || "../assets/images/default.jpg"}
                    id={`avatar${index}`}
                    alt={`avatar${card.name}`}
                  />
                  <div className="min-w-0 py-5 pr-5 pl-28">
                    <div className="truncate text-sm font-medium text-slate-900 sm:text-base dark:text-slate-200">
                      {card.name}
                    </div>
                    <div className="truncate text-sm leading-tight font-medium text-slate-500 sm:text-base dark:text-slate-400">
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
