/** @format */

import { useEffect, useState } from 'react';

/**
 * @useLoading - A function that simulates a loading page for 3 secs
 * @params - Takes no parameters
 *
 * @returns - isLoading (true or false)
 */
export const useLoading = (simulate = false) => {
  // If simulation not requested, don't show loading overlay
  if (!simulate) return false;

  /**
   * Creating a useState to store isLoading variable and setIsLoading to make changes
   */
  const [isLoading, setIsLoading] = useState<boolean>(true);

  /**
   * React useEffect that runs once the webpage loads and setting loading to false
   * after 3 secs ~ Happening as a result of adding an Empty array []
   */
  useEffect(() => {
    const timeoutID = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    /**
     * cleaning up  ~ for performance optimization
     */
    return () => clearTimeout(timeoutID);
  }, []); //The empty Array for it to run once

  return isLoading;
};
